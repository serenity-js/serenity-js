---
title: Jira and other issue trackers
layout: handbook.hbs
---
# Jira and other issue trackers

Test reports and living documentation produced by [Serenity BDD](/modules/serenity-bdd) can link to tickets in your issue tracker, such as [Jira](https://www.atlassian.com/software/jira), [Trello](https://trello.com/), etc.

Linking from your Serenity BDD report to a ticket in an issue tracker does not affect the status of the ticket
and is meant to make it easier for you and your team to understand and document the context that led to the feature being implemented.

In this chapter, I'll show you how to create those links automatically in three easy steps.

## Step 1 - Create a Serenity/JS project

First, you'll need a Node.js project with Serenity/JS and Cucumber. 

The easiest way to create such project is to use one of the [Serenity/JS template projects](https://github.com/serenity-js/), for example [`serenity-js-cucumber-protractor-template`](https://github.com/serenity-js/serenity-js-cucumber-protractor-template).

## Step 2 - Tag your scenarios and features

The next step is to tag your Cucumber scenarios and features with appropriate ticket IDs.

Let's say you have created a "My Serenity/JS Project" in Jira, Trello, or a similar issue tracker.
If your issue tracker of choice identifies tickets using unique ticket IDs (i.e. `MSP-1`, `MSP-2`, etc.), and allows you to access them at unique URLs (i.e. `https://jira.my-company.com/browse/MSP-1`), you can link to the issue tickets from your Serenity BDD reports.

To do that, tag either `Feature` or `Scenario` nodes of your Cucumber `.feature` files with `@issue:<issueId>` or `@issues:<issueIds>` tags to create the links automatically when the report is generated.

The below `.feature` file demonstrates usage of both `@issue` and `@issues` tags:

```gherkin
@issue:MSP-1
Feature: Basic arithmetic operations

  The feature itself, as well as all the scenarios in this file will be linked
  to the **MSP-1** ticket in your issue tracker. 
  Linking to a ticket **does not** affect the status of ticket.

  Please note that you can use the feature's description section to capture the acceptance criteria
  and use the [Markdown syntax](https://daringfireball.net/projects/markdown/syntax)
  to link to any **external documents**, wikis, etc.

  Background:
    Given Dominique has requested a new calculation

  @issue:MSP-2
  Scenario: Addition

    This scenario will be linked to both the **MSP-1** issue, inherited from the `Feature`,
    and the **MSP-2** issue, because of the `@issue` tag used at the `Scenario` level

    When Dominique enters 2
     And she uses the + operator
     And she enters 3
    Then she should get a result of 5

  @issue:MSP-2
  @issue:MSP-3
  Scenario: Subtraction

    This scenario will be linked to **MSP-1**, as well as **MSP-2** and **MSP-3** issues.

    When Dominique enters 4
     And she uses the - operator
     And she enters 3
    Then she should get a result of 1

  @issues:MSP-2,MSP-4
  Scenario: Multiplication

    Instead of using multiple `@issue` tags we use a single `@issues` tag to link the scenario to several tickets.

    When Dominique enters 2
     And she uses the * operator
     And she enters 8
    Then she should get a result of 16
```

## Step 3 - Tell Serenity BDD where your issue tracker is 

To make Serenity BDD generate links to tickets in your issue tracker, you need to tell it where your issue tracker is.

Serenity BDD works with issue trackers that provide a Web UI and support [deep linking](https://en.wikipedia.org/wiki/Deep_linking).
You can configure the location of your issue tracker using a command line parameter passed to the `serenity-bdd run` command.

Since all the [Serenity/JS template projects](https://github.com/serenity-js) have a `test:report` script invoking `serenity-bdd run` [defined in their `package.json` file](https://github.com/serenity-js/serenity-js-cucumber-protractor-template/blob/518285a5578a9cb3600a44eb3d10f4413bde8428/package.json#L12), this is what you need to configure. 

### Jira

If your Jira server can be accessed at `https://jira.my-company.com`, you can configure its location using the `--jiraUrl` parameter:

```json
"test:report": "serenity-bdd run --jiraUrl 'https://jira.my-company.com'",
```

### Other issue trackers

If you're using a different issue tracker, you can configure its location using the `--issueTrackerUrl` parameter, where the `{0}` token
will be replaced with the `issueId`:

```json
"test:report": "serenity-bdd run --issueTrackerUrl 'https://trello.com/c/MyBoardId/{0}'",
```

The above configuration will produce links such as `https://trello.com/c/MyBoardId/MSP-1`

## Summary

Tagging `Feature` and `Scenario` nodes of your Cucumber `.feature` files with `@issues` and `@issue` and providing either a `--jiraUrl` or an `--issueTrackerUrl` when invoking the `serenity-bdd run` command instructs the Serenity BDD reporter to augment the scenario reports with
links to your issue tracker: 

<figure>
![Serenity BDD Scenario Report](/handbook/integration/images/jira-and-other-issue-trackers/scenario-report.png)
    <figcaption><span>Scenario report</span></figcaption>
</figure>

However, this is just one of the benefits. Another one is that once Serenity understands what scenarios and features concern what tickets,
it can provide you with another way to slice your reports:

<figure>
![Serenity BDD Summary Report](/handbook/integration/images/jira-and-other-issue-trackers/summary-report.png)
    <figcaption><span>Summary report with an additional section describing the "Issues"</span></figcaption>
</figure>

This is particularly useful if you need a way to see all the scenarios that cover a given ticket:

<figure>
![Serenity BDD Issue Report](/handbook/integration/images/jira-and-other-issue-trackers/issue-report.png)
    <figcaption><span>Report showing test scenarios concerning a given ticket</span></figcaption>
</figure>
