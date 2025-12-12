export class CheckInstance {
    /**
     * Check if current instance is instance 0
     * @returns true if NODE_APP_INSTANCE is 0 or undefined
     */
    static isInstance0(): boolean {
        return (Number(process.env.NODE_APP_INSTANCE) || 0) === 0
    }

    /**
     * Get current instance number
     * @returns current instance number (default 0)
     */
    static getCurrentInstance(): number {
        return Number(process.env.NODE_APP_INSTANCE) || 0
    }

    /**
     * Check if current instance matches specific instance number
     * @param instanceNumber - instance number to check
     * @returns true if current instance matches the specified number
     */
    static isInstance(instanceNumber: number): boolean {
        return this.getCurrentInstance() === instanceNumber
    }

    /**
     * Check if current instance is master (instance 0)
     * @returns true if current instance is master
     */
    static isMaster(): boolean {
        return this.isInstance0()
    }
}
