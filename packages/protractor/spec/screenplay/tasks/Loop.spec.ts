import 'mocha';

import { Ensure, equals, not } from '@serenity-js/assertions';
import { actorCalled, engage, Loop } from '@serenity-js/core';
import { by, ElementFinder } from 'protractor';

import { Click, isSelected, Navigate, Target, Text } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('Loop', () => {

    const pageWithAComplexForm = pageFromTemplate(`
        <html>
          <body>
            <form>
              <div>
                  <label for="option1">
                      <input type="checkbox" id="option1" />
                      Option 1
                  </label>
              </div>
              <div>
                  <label for="option2">
                      <input type="checkbox" id="option2" />
                      Option 2
                  </label>
              </div>
              <div>
                  <label for="option3">
                      <input type="checkbox" id="option3" />
                      Option 3
                  </label>
              </div>
              <code><pre id="output"></pre></code>
            </form>
            <script>
              document.querySelectorAll('input').forEach(function (item) {
                item.addEventListener('click', function(event) {
                  document.getElementById('output').insertAdjacentHTML(
                        'beforeend',
                        item.id + ' ' + ( item.checked ? 'checked' : 'unchecked' ) + '\\n'
                    );
                })
              });
            </script>
          </body>
        </html>
    `);

    const Form = {
        Labels:     Target.all('form labels').located(by.tagName('label')),
        Checkbox:   Target.the('checkbox').located(by.tagName('input')),
        Output:     Target.the('output').located(by.id('output')),
    };

    beforeEach(() => engage(new UIActors()));

    it('allows the actor to perform a sequence of activities for every element given', () =>
        actorCalled('Joe').attemptsTo(
            Navigate.to(pageWithAComplexForm),

            Loop.over(Form.Labels).to(
                Ensure.that(Form.Checkbox.of(Loop.item<ElementFinder>()), not(isSelected())),
                Click.on(Loop.item()),
                Ensure.that(Form.Checkbox.of(Loop.item()), isSelected()),
            ),

            Ensure.that(Text.of(Form.Output), equals('option1 checked\noption2 checked\noption3 checked')),
        ));
});
