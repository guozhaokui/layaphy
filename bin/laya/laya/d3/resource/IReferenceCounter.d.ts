export interface IReferenceCounter {
    _getReferenceCount(): number;
    _addReference(count: number): void;
    _removeReference(count: number): void;
    _clearReference(): void;
}
