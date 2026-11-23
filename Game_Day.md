# Lumen Health — Game-Day Evidence

**Documentation prepared by:** Terri-Etana Thoms  
**Exercise date:** 23 November 2026  
**Time zone:** Jamaica (UTC−5)

## Purpose

The team’s game-day exercise tests whether Lumen Health can detect a fault, respond to an alert, redeploy a known-good image, and return to healthy service within ten minutes. This file records the actions and evidence available for the group repository.

## Deployment baseline

A successful CI run on `main` showed the test, web build, server build, staging deployment, and production deployment jobs passing. This establishes deployment evidence for the project. The image rollback is documented separately below.

## Image rollback rehearsal

Maxwell ran the CI workflow manually using a previous commit SHA as the image tag. The workflow skipped the build job and used the previously published images.

| Item | Recorded result |
|---|---|
| Operator | Maxwell |
| Workflow run | [Manual rollback run](https://github.com/raheem81kg/lumen-health/actions/runs/45211521835) |
| Image SHA before rollback | `ec15d3b55cfeb6cc013ba6d1b0b3dbaf7352c394` |
| Previous image SHA selected | `ba4a6f6cf5943a4496a6296629e4fd91a9a2d7a5` |
| Reported start time | 11:00:00 AM |
| Staging health check passed | 11:01:23 AM |
| Time from reported start to staging health | 1 minute 23 seconds |
| Production health check passed | 11:01:59 AM |

The [workflow run](https://github.com/raheem81kg/lumen-health/actions/runs/45211521835) shows `test` passing, `build` skipped, and both `deploy-staging` and `deploy-prod` passing. The deployment logs show `IMAGE_TAG` set to the previous SHA, the web and server images pulled, the containers recreated, and the workflow health checks succeeding.

**Scope of the run:** The manual workflow deployed the previous SHA to **both staging and production**. The reported staging recovery interval was under the ten-minute target. This interval measures from Maxwell’s reported workflow start to the staging workflow health check; it is not a measured fault-to-recovery interval.

## Evidence

- [Rollback workflow run: previous SHA deployed and health checks passed](https://github.com/raheem81kg/lumen-health/actions/runs/45211521835)
- Screenshot supplied by the team of the successful **Deploy and wait for health checks** step showing the previous `IMAGE_TAG`.
- Screenshots of the successful deployment jobs supplied by the team.

The workflow health check covers the API `/health` route and the web response. This run does not, by itself, establish the result of `/ready`, a user-facing functional test, or a monitoring alert.

## Fault and alert sequence

No fault-injection and alert-firing times from this **group repository exercise** have been added to this record. The image rollback run above demonstrates redeployment of a previous image and successful workflow health checks. A complete fault → alert → rollback → healthy timeline requires the corresponding fault and monitoring evidence.

When the team performs that sequence, record the actual results here:

| Event | Jamaica time | Evidence |
|---|---|---|
| Fault introduced | — | — |
| Application errors observed | — | — |
| Alert entered pending state | — | — |
| Alert entered firing state | — | — |
| Rollback started | — | — |
| Known-good image deployed | — | — |
| Application and monitoring healthy | — | — |
| Total fault-to-recovery duration | — | — |

## Restoration to the latest image

Maxwell reported that he restored the latest SHA, `ec15d3b55cfeb6cc013ba6d1b0b3dbaf7352c394`, after the rollback rehearsal. Add the restoration workflow run link and final staging and production health results here when available. The rollback run linked above is evidence of deploying the **previous** SHA, not evidence of the subsequent restoration.

## Findings

1. The manual workflow ran its deployment jobs without rebuilding the images.
2. The previous SHA was selected for the deployment, and the workflow health checks passed.
3. The manual run deployed to both staging and production.
4. The reported staging rollback interval was 1 minute 23 seconds, below the ten-minute target.
5. The full fault-to-alert-to-recovery duration cannot be calculated from this rollback run alone.