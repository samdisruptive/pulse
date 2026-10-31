# Specification conflicts

This register records contradictions and unresolved choices without silently
selecting an implementation. Resolve each item before its affected milestone.

| ID       | Area                   | Conflict                                                                                                                                        | Decision point                 | Status |
| -------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------ |
| SPEC-001 | Permissions            | `permissions.md` grants `viewIntegrations`, `useMcp`, Viewer client AI and broader Specialist capabilities that the handoff role summary omits. | Before authentication and RBAC | Open   |
| SPEC-002 | Data model             | User, Client, Connection, Lead and FX field lists differ between `data-model.md` and prompt summaries.                                          | Before first Prisma migration  | Open   |
| SPEC-003 | Fact dimensions        | Prompt 11 omits `hostName` and `searchAppearance`, although later provider requirements and `data-model.md` require them.                       | Before provider fact schema    | Open   |
| SPEC-004 | GA4 history            | Integration schedule says about 14 months; the handoff requires a 16-month backfill and load test.                                              | Before GA4 implementation      | Open   |
| SPEC-005 | Late-data sync         | Fixed provider windows differ from the handoff rule `expectedLagDays + 2`.                                                                      | Before worker scheduling       | Open   |
| SPEC-006 | Design density         | The token row height is 42px; the prototype applies 40px at default runtime density.                                                            | Visual milestone               | Open   |
| SPEC-007 | Design tokens          | Prototype aliases and additions (`li`, `accent-ink`, `scrim`, `radius-xl`) do not all exist in the token file.                                  | Visual milestone               | Open   |
| SPEC-008 | Client knowledge route | The route is listed once as `/knowledge` and later as `/clients/[clientId]/knowledge`.                                                          | Route implementation           | Open   |
| SPEC-009 | Uptime location        | Prototype copy describes London and Frankfurt checks; the handoff specifies a single VPS location initially.                                    | Uptime milestone               | Open   |
| SPEC-010 | AI budget response     | The handoff mentions a `budget` status absent from the documented `AIResponse` status enum.                                                     | AI milestone                   | Open   |
| SPEC-011 | MCP hosting            | MCP is documented as a web route, while the handoff also permits a separate service in the same image.                                          | MCP milestone                  | Open   |
| SPEC-012 | Brand assets           | Final body font and logo SVG are not supplied; Plus Jakarta Sans and the prototype lockup are stand-ins.                                        | Visual milestone               | Open   |

## Resolution process

1. Confirm the relevant source documents and current external API
   documentation.
2. Record the selected behaviour in an ADR.
3. Update this row to `Resolved` and link the ADR.
4. Update conflicting specifications where appropriate.
