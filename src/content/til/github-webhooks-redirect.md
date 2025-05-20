---
title: "Github Apps Webhooks Don't Follow Redirects"
date: 2024-05-09
tags: ["git", "github", "tips", "development", "webhooks"]
---

# GitHub Apps Webhooks Don’t Follow Redirects

I was debugging a GitHub App webhook today and noticed something odd—my endpoint wasn’t receiving the payload, even though everything looked right on GitHub’s end.

After a bit of head-scratching and some log tracing, I realized the issue: the webhook was being sent to an endpoint that returned a 301 redirect. Turns out, GitHub Apps *do not follow redirects* when sending webhooks. They expect a 2xx status from the original URL and won’t chase down where it might have moved.
