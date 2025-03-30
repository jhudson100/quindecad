/** A clipping plane. This is used to specify clipping along
 *  the x, y, z axes for viewing (but not for modifying
 * geometry)
*/

export class ClippingPlane {
    A: number;
    B: number;
    C: number;
    D: number;
    constructor(A: number, B: number, C: number, D: number) {
        this.A = A;
        this.B = B;
        this.C = C;
        this.D = D;
    }
}
