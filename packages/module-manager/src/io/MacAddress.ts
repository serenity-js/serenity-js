export class MacAddress {

    private readonly address: string;

    constructor(address: string) {
        this.address = address.toLowerCase();
    }

    isUnique(): boolean {
        return ! this.isPlaceholder()
            && ! this.isBroadcast()
            && ! this.isMulticast()
            && ! this.isLocallyAdministered();
    }

    /**
     * Checks if the least significant bit of the first byte is set to 1
     */
    isMulticast(): boolean {
        return Boolean(this.firstByte() & 0x01);
    }

    /**
     * Check if the second least significant bit of the first byte is set to 1
     */
    isLocallyAdministered(): boolean {
        return Boolean(this.firstByte() & 0x02);
    }

    /**
     * Checks if the MAC address is ff:ff:ff:ff:ff:ff (broadcast address)
     */
    isBroadcast(): boolean {
        return this.address.toLowerCase() === 'ff:ff:ff:ff:ff:ff';
    }

    /**
     * Checks if all bytes of the MAC address are zeros
     */
    isPlaceholder(): boolean {
        return this.address.toLowerCase() === '00:00:00:00:00:00';
    }

    private firstByte(): number {
        const cleanAddress = this.address.toLowerCase().replaceAll(/[^\da-f]/g, '');

        return Number.parseInt(cleanAddress.slice(0, 2), 16);
    }

    toString(): string {
        return this.address;
    }
}
