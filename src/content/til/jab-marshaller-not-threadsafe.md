---
title: "JAXB Marshallers and Unmarshallers are not thread-safe"
date: 2025-05-20
tags: ["java", "jaxb", "development", "bugs", "kotlin"]
---

# TIL: JAXB Marshallers and Unmarshallers are not thread-safe

If you’re using JAXB in Java, be careful because `Marshaller` and `Unmarshaller` instances are **not** thread-safe. 
The `JAXBContext` is, however. 

That means you shouldn’t reuse them across threads without some kind of synchronization. I ended fixing this by using`ThreadLocal`.

I found this today while debugging a weird serialization issue. One of those bugs that only shows up under load... 