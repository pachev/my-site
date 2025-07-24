---
title: "Solace SMF ports don't bind to IPv6 (but here's a fix)"
date: 2025-07-23
tags: ["solace", "kubernetes", "ipv6", "networking", "workarounds"]
---
# TIL: Solace SMF ports don't bind to IPv6 (but here's a fix)

If you're running Solace PubSub+ in an IPv6-only Kubernetes cluster, you'll discover that SMF ports (55555, 55003) only bind to IPv4. 
Ports 8080 and 2222 work fine with IPv6, but the main messaging ports? Nope.
There's no CLI command, no environment variable, no config to fix this. I searched everywhere.

The workaround? Run a SOCAT sidecar to proxy IPv6 to IPv4:

```yaml
- name: socat-ipv6-proxy
  image: alpine/socat:latest
  command:
  - sh
  - -c
  - |
    socat TCP6-LISTEN:31555,fork,reuseaddr TCP4:127.0.0.1:55555 &
    socat TCP6-LISTEN:31003,fork,reuseaddr TCP4:127.0.0.1:55003 &
    # Keep container running
    while true; do sleep 300; done
```

Then update your Service to map external ports to the proxy ports:
```yaml
ports:
- port: 55555
  targetPort: 31555  # IPv6 proxy port
```

One of those bugs that makes you question your sanity until you realize it's just not implemented...
