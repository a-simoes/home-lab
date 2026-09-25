# Software

The control side of the coop runs on a **Shelly Plus Uni**, model `SNSN-0043X`, a Gen2
device on firmware 2.0.0. Everything on this page is the Gen2 RPC API, so it applies to
this model and to other Gen2 Shelly devices, but not to the older Shelly Uni, whose API
and inputs are different.

- [Configuration](configuration.md) for what is set on the device and why
- [scripts/](scripts/) for the mJS running on it

## Reaching the device

Everything below is read and written over plain HTTP on the local network. No cloud
account and no app are needed.

The device answers on its own address, which the router hands out by DHCP and can change.
It also answers on its mDNS name, `shellyplusuni-***.local`, which does not change, so
prefer that once you have it.

Every API method is a URL. The pattern is `http://<device>/rpc/<Method>`, and a browser
works as well as a terminal:

```
http://<device>/rpc/Shelly.GetConfig
http://<device>/rpc/Shelly.GetStatus
http://<device>/rpc/Schedule.List
http://<device>/rpc/Script.List
http://<device>/rpc/Sys.GetStatus
```

Methods that take arguments accept them as query parameters:

```
http://<device>/rpc/Switch.GetStatus?id=0
http://<device>/rpc/Script.GetCode?id=2
```

From a terminal, piping through `python3 -m json.tool` makes the answer readable:

```bash
curl -s http://<device>/rpc/Shelly.GetConfig | python3 -m json.tool
```

Anything that changes state is the same pattern. This opens the door, and `auto_off`
closes the circuit again 35 seconds later:

```bash
curl -s http://<device>/rpc/Switch.Set?id=0\&on=true
```

For calls with nested arguments, post JSON instead:

```bash
curl -s -X POST http://<device>/rpc -d '{"id":1,"method":"Schedule.Update","params":{"id":2,"enable":true}}'
```

Authentication is currently off, so anything on the network can issue these, including the
ones that move the door.
