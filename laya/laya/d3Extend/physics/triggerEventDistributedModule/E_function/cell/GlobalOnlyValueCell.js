export class GlobalOnlyValueCell {
    static getOnlyID() {
        GlobalOnlyValueCell.currentID += 1;
        return GlobalOnlyValueCell.currentID;
    }
}
GlobalOnlyValueCell.currentID = 0;
