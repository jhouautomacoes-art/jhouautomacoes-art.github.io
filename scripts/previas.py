"""Registro de amostras públicas e montagem do site; código próprio, stdlib."""
from __future__ import annotations
import argparse
import datetime as dt
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
START = '<script type="application/json" id="samples-data">'
END = '</script>'
MAX_HOURS = 72
MAX_SAMPLES = 20

def instant(value):
    value = dt.datetime.fromisoformat(value.replace('Z', '+00:00'))
    if value.tzinfo is None:
        raise ValueError('Timestamp must include timezone')
    return value.astimezone(dt.timezone.utc)

def valid_sample(sample):
    if set(sample) != {'id', 'title', 'template', 'created_at', 'expires_at'}:
        raise ValueError('Unexpected sample fields')
    if not re.fullmatch(r'[a-z0-9-]{4,64}', sample['id']):
        raise ValueError('Invalid sample id')
    if sample['template'] != 'uniformes' or not isinstance(sample['title'], str) or not 1 <= len(sample['title']) <= 90:
        raise ValueError('Invalid sample template/title')
    created, expires = instant(sample['created_at']), instant(sample['expires_at'])
    if not dt.timedelta(0) < expires-created <= dt.timedelta(hours=MAX_HOURS):
        raise ValueError('Lifetime exceeds 72 hours')
    return created, expires

def split_registry(html):
    if html.count(START) != 1:
        raise ValueError('Exactly one registry is required')
    before, rest = html.split(START, 1)
    raw, after = rest.split(END, 1)
    samples = json.loads(raw)
    if not isinstance(samples, list) or len(samples) > MAX_SAMPLES:
        raise ValueError('Invalid registry size')
    ids = set()
    for sample in samples:
        valid_sample(sample)
        if sample['id'] in ids:
            raise ValueError('Duplicate sample id')
        ids.add(sample['id'])
    return before, samples, after

def update_registry(html, samples):
    before, _, after = split_registry(html)
    raw = json.dumps(samples, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    return before + START + raw + END + after

def cleanup(html, at):
    if at.tzinfo is None:
        raise ValueError('Cleanup requires timezone')
    _, samples, _ = split_registry(html)
    active = [s for s in samples if instant(s['expires_at']) > at]
    return update_registry(html, active), len(samples)-len(active)

def build_site(root):
    root = root.resolve()
    destination = root/'_site'
    if not destination.resolve().is_relative_to(root):
        raise ValueError('Build output outside repository')
    destination.mkdir(exist_ok=True)
    names = subprocess.check_output(['git', 'ls-files', '-z'], cwd=root).decode().split('\0')
    allowed = {'.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.woff', '.woff2'}
    count = 0
    for name in names:
        if not name or name.split('/')[0] in {'scripts', 'tests', '.github', '_site'}:
            continue
        source = root/name
        if source.suffix.lower() not in allowed or source.is_symlink():
            continue
        if not source.resolve().is_relative_to(root):
            raise ValueError('Asset outside repository')
        target = destination/name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        count += 1
    (destination/'.nojekyll').write_text('', encoding='utf-8')
    return count

def main():
    p=argparse.ArgumentParser()
    p.add_argument('action', choices=['check', 'clean', 'build', 'add'])
    p.add_argument('--id'); p.add_argument('--title')
    p.add_argument('--hours', type=int, default=72)
    a=p.parse_args()
    path=ROOT/'previas.html'
    html=path.read_text(encoding='utf-8')
    _, samples, _=split_registry(html)
    if a.action=='check':
        print(json.dumps({'samples':len(samples), 'max_hours':MAX_HOURS})); return
    if a.action=='build':
        print(json.dumps({'assets':build_site(ROOT)})); return
    current=dt.datetime.now(dt.timezone.utc)
    changed, removed=cleanup(html, current)
    if a.action=='add':
        if not a.id or not a.title or not 1<=a.hours<=MAX_HOURS:
            raise ValueError('Add needs id/title and 1..72 hours')
        _, active, _=split_registry(changed)
        if any(s['id']==a.id for s in samples):
            raise ValueError('Never overwrite/reuse an existing link id')
        if len(active)>=MAX_SAMPLES: raise ValueError('Sample limit reached')
        sample={'id':a.id,'title':a.title,'template':'uniformes',
                'created_at':current.isoformat(timespec='seconds'),
                'expires_at':(current+dt.timedelta(hours=a.hours)).isoformat(timespec='seconds')}
        valid_sample(sample); active.append(sample); changed=update_registry(changed,active)
    if changed!=html:
        temporary=path.with_suffix('.html.tmp')
        temporary.write_text(changed,encoding='utf-8'); temporary.replace(path)
    print(json.dumps({'removed':removed,'changed':changed!=html},ensure_ascii=False))

if __name__=='__main__': main()
