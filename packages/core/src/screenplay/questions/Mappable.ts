export interface Mappable<Item_Type, Collection_Type extends Mappable<Item_Type, Collection_Type>> {
    map<Mapped_Item_Type>(
        mapping: (item: Item_Type, index?: number, collection?: Collection_Type) => Mapped_Item_Type
    ): Promise<Array<Awaited<Mapped_Item_Type>>> | Array<Mapped_Item_Type>;
}
