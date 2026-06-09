# Arive routing — domain-switch status

The two Arive form URLs are EXTERNAL (stairwaymortgage.my1003app.com, auth.lendwize.io).
They are NOT affected by the stairwaymortgage.com domain switch — no action needed at switch.

The only domain-coupled item from this task: the vercel.json 301 redirect SOURCES are
relative paths (/apply-for-mortgage etc.), which work on any domain. Destinations are the
external Arive URLs. So redirects survive the switch unchanged. Nothing to do at switch.
