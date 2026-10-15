import json
import unittest

from scripts.configure_analytics import START, END, update


class ConfigureAnalyticsTests(unittest.TestCase):
    def test_set_and_disable_only_change_public_website_id(self):
        original = '<h1>Prévia</h1>' + START + '{"websiteId":""}' + END + '<footer>Jhou</footer>'
        configured = update(original, 'E676C9B4-11E4-4EF1-A4D7-87001773E9F2')
        self.assertIn(json.dumps({'websiteId': 'e676c9b4-11e4-4ef1-a4d7-87001773e9f2'}, separators=(',', ':')), configured)
        self.assertEqual(update(configured, ''), original)
        self.assertIn('<footer>Jhou</footer>', configured)

    def test_api_key_and_html_are_rejected(self):
        original = START + '{"websiteId":""}' + END
        for invalid in ['api_secret', '</script>', '']:
            if invalid:
                with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                    update(original, invalid)


if __name__ == '__main__':
    unittest.main()
