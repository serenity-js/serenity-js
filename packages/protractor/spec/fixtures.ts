import { minify } from 'html-minifier';
import { Target } from '../src/screenplay/questions/targets';
import { by } from 'protractor';

export function pageFromTemplate(template: string): string {
    return `data:text/html;charset=utf-8,${ minify(`<!DOCTYPE html>${ template }`, {
        collapseWhitespace: true,
        removeComments: true,
        preserveLineBreaks: false,
        keepClosingSlash: true,
    }) }`;
}

export const alertTargets = {
    trigger: Target.the('alert trigger').located(by.id('alert-demo-trigger')),
    textResult: Target.the('text of the alert clicking result').located(by.id('alert-demo-result'))
};

export const pageWithAlerts = `
    <!DOCTYPE html>
        <html>
            <body>
                <p>Test page for <a href="./Alert.spec.ts">alert visibility unit test</a></p>
                <button id="alert-demo-trigger" onclick="myFunction()">Trigger Alert</button>
                <p id="alert-demo-result"></p>
                <script>
                    function myFunction() {
                        var resultText;
                        var response = confirm("Press OK or Cancel");
                        if (response) {
                            resultText = "You pressed OK!";
                        } else {
                            resultText = "You pressed Cancel!";
                        }
                        document.getElementById("alert-demo-result").innerHTML = resultText;
                    }
                </script>
            
            </body>
        </html>
`;
