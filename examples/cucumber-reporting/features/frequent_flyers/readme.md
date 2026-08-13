# Frequent Flyers

The Frequent Flyer programme rewards loyal travellers with points they can redeem for flights and upgrades.

## Business Rules

| Action | Points Earned | Conditions |
|--------|--------------|------------|
| Domestic flight | 100 pts/segment | Economy class |
| International flight | 250 pts/segment | Economy class |
| Domestic flight | 200 pts/segment | Business class |
| International flight | 500 pts/segment | Business class |

## Membership Tiers

| Tier | Threshold | Benefits |
|------|-----------|----------|
| 🥉 Bronze | 0 pts | Basic earning |
| 🥈 Silver | 5,000 pts | Priority boarding, +25% bonus points |
| 🥇 Gold | 25,000 pts | Lounge access, +50% bonus points, free upgrades |

## Related Documentation

- [Earning rules specification](https://serenity-js.org/handbook/) — how points are calculated
- [Cucumber Data Tables](https://cucumber.io/docs/gherkin/reference/#data-tables) — used extensively in these scenarios

## Example Scenario

```gherkin
Scenario: Earning standard points on a domestic flight
  Given a Frequent Flyer member with Bronze status
  When they complete a domestic flight in Economy
  Then they should earn 100 points
```
