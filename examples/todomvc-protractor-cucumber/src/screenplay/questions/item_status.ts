import { BrowseTheWeb } from 'serenity-bdd/lib/serenity-protractor';
import { Question, UsesAbilities } from 'serenity-bdd/lib/serenity/screenplay';

import { TodoList } from '../user_interface';

export class ItemStatus implements Question<string> {
    static of(itemName: string) {
        return new ItemStatus(itemName);
    }

    answeredBy(actor: UsesAbilities): Promise<string> {
        return BrowseTheWeb.as(actor)
            .locate(TodoList.Complete_Item_Checkbox.of(this.itemName))
            .isSelected()
            .then(selected => selected ? 'completed' : 'active');
    }

    constructor(private itemName: string) {
    }
}
