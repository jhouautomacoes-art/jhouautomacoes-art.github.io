import datetime as dt
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from scripts.previas import START, END, cleanup, split_registry, update_registry, build_site

BASE=dt.datetime(2026,10,13,20,0,tzinfo=dt.timezone.utc)

def sample(i='exemplo-123',hours=72):
    return {'id':i,'title':'Ideia ilustrativa','template':'uniformes',
            'created_at':BASE.isoformat(),'expires_at':(BASE+dt.timedelta(hours=hours)).isoformat()}

def document(records):
    return '<!doctype html><h1>Site preservado</h1>'+START+json.dumps(records)+END+'<footer>Marca</footer>'

class PreviewLifecycleTests(unittest.TestCase):
    def test_service_template_is_supported_and_expires_under_same_limits(self):
        entry=dict(sample(),template='servicos')
        cleaned,removed=cleanup(document([entry]),BASE+dt.timedelta(hours=72))
        self.assertEqual(removed,1);self.assertEqual(split_registry(cleaned)[1],[])

    def test_unknown_template_is_rejected(self):
        with self.assertRaisesRegex(ValueError,'template'):
            split_registry(document([dict(sample(),template='external')]))

    def test_active_just_before_72_hours_is_preserved(self):
        cleaned,removed=cleanup(document([sample()]),BASE+dt.timedelta(hours=72)-dt.timedelta(seconds=1))
        self.assertEqual(removed,0); self.assertEqual(len(split_registry(cleaned)[1]),1)

    def test_sample_is_removed_at_exact_72_hour_boundary(self):
        cleaned,removed=cleanup(document([sample()]),BASE+dt.timedelta(hours=72))
        self.assertEqual(removed,1);self.assertEqual(split_registry(cleaned)[1],[])
        self.assertIn('<h1>Site preservado</h1>',cleaned); self.assertIn('<footer>Marca</footer>',cleaned)

    def test_cleanup_is_idempotent_and_only_expired_records_are_removed(self):
        html=document([sample(hours=1),sample(i='outra-123',hours=72)])
        first,removed=cleanup(html,BASE+dt.timedelta(hours=2))
        second,again=cleanup(first,BASE+dt.timedelta(hours=2))
        self.assertEqual(removed,1);self.assertEqual(again,0);self.assertEqual(first,second)
        self.assertEqual(split_registry(first)[1][0]['id'],'outra-123')

    def test_lifetime_cannot_exceed_72_hours(self):
        with self.assertRaisesRegex(ValueError,'72 hours'): split_registry(document([sample(hours=73)]))

    def test_naive_time_and_nonpositive_lifetime_are_rejected(self):
        invalid=sample();invalid['created_at']='2026-10-13T20:00:00'
        with self.assertRaisesRegex(ValueError,'timezone'):split_registry(document([invalid]))
        with self.assertRaises(ValueError):split_registry(document([sample(hours=0)]))

    def test_duplicate_ids_and_unapproved_fields_are_rejected(self):
        with self.assertRaisesRegex(ValueError,'Duplicate'):split_registry(document([sample(),sample()]))
        with self.assertRaisesRegex(ValueError,'fields'):split_registry(document([dict(sample(),send=True)]))

    def test_registry_does_not_grow_beyond_20_samples(self):
        with self.assertRaisesRegex(ValueError,'size'):
            split_registry(document([sample(i='amostra-'+str(i)) for i in range(21)]))

    def test_title_cannot_break_out_of_json_script(self):
        html=document([]);x=sample();x['title']='</script><img src=x>'
        updated=update_registry(html,[x])
        self.assertEqual(updated.count('</script>'),1)
        self.assertEqual(split_registry(updated)[1][0]['title'],x['title'])

    def test_build_copies_only_tracked_public_assets(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            subprocess.run(['git','init','--quiet',folder],check=True)
            (root/'index.html').write_text('Public website',encoding='utf-8')
            (root/'previas.html').write_text(document([]),encoding='utf-8')
            (root/'scripts').mkdir();(root/'scripts/private-example.py').write_text('Synthetic excluded data')
            (root/'untracked.html').write_text('Untracked synthetic data')
            subprocess.run(['git','add','index.html','previas.html','scripts/private-example.py'],cwd=root,check=True)
            self.assertEqual(build_site(root),2)
            self.assertTrue((root/'_site/index.html').exists())
            self.assertFalse((root/'_site/scripts').exists())
            self.assertFalse((root/'_site/untracked.html').exists())

if __name__=='__main__':unittest.main()
