## Game-day evidence and findings

The team conducted a staging fault-injection rehearsal documented in the
[lumen-health-solo game-day report](https://github.com/raheem81kg/lumen-health-solo/blob/main/docs/game-day.md).
Raheem operated the exercise. The API was set to return HTTP 500 for tRPC
requests while `/health` remained green. This demonstrated why process
health alone could not detect failed application traffic.

### Recorded timeline

| Time recorded in the report | Event |
|---|---|
| 15:49:00 | Fault injected; tRPC requests began failing |
| 15:49:47 | First 500 responses visible in the error-rate panel |
| 15:50:44 | `HighErrorRate` entered pending state |
| 15:51:14 | `HighErrorRate` entered firing state |
| 15:54:00 | Operator used the runbook and identified the injected fault |
| 15:54:20 | Fault cleared |
| 15:54:40 | Successful traffic resumed and the alert resolved |

### Screenshots

- [Prometheus: HighErrorRate firing](https://github.com/raheem81kg/lumen-health-solo/blob/main/docs/evidence/screenshot-alert-HighErrorRate.png)
- [Grafana: error spike and firing alert](https://github.com/raheem81kg/lumen-health-solo/blob/main/docs/evidence/screenshot-dashboard-error-spike.png)

The report records approximately 90 seconds to the first alert signal and
approximately 20 seconds from clearing the fault to healthy responses and
alert resolution. The operator cleared the injected fault rather than
redeploying an earlier image. Therefore, these screenshots prove alert
detection and recovery from the injected fault; they do not prove an
image-based rollback or a measured rollback time.

### Lesson

`/health` stayed green while application requests failed. The error-rate
metric and `HighErrorRate` alert exposed the problem, and the runbook guided
the operator to identify and clear the fault.