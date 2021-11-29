Feature: Transferring points between members

  As a Frequent Flyer Member
  I want to transfer points that I don't need to members of my family
  So that the points don't go to waste

  Background:

    There are two families, each with their unique family code

    Given the following Frequent Flyer members:
      | Name  | Surname | Family Code |
      | Sarah | Sparrow | FAM-101     |
      | Steve | Sparrow | FAM-101     |
      | Fred  | Falcon  | FAM-202     |

  Rule: Frequent Flyer members in the same family can transfer points

    Each family has a unique family code

    Example: Transfer points between existing members

      Sarah and Steve are members of the same family

      Given the following Frequent Flyer account balances:
        | owner | points | status-points |
        | Sarah | 100000 | 800           |
        | Steve | 50000  | 50            |
      When Sarah transfers 40000 points to Steve
      Then the accounts should be as follows:
        | owner | points | status-points |
        | Sarah | 140000 | 800           |
        | Steve | 10000  | 50            |

    Example: Transfer points between non-family members

      Sarah and Fred are members of different families

      Given the following Frequent Flyer account balances:
        | owner | points | status-points |
        | Sarah | 100000 | 800           |
        | Fred  | 20000  | 50            |
      When Sarah tries to transfer 10000 points to Fred
      Then the transfer should not be allowed

  Rule: Members cannot transfer more points than they have

    Example: Steve tries to transfer more points than he has

      Given the following Frequent Flyer account balances:
        | owner | points | status-points |
        | Sarah | 100000 | 800           |
        | Steve | 50000  | 50            |
      When Steve tries to transfer 100000 points to Sarah
      Then the transfer should not be allowed
