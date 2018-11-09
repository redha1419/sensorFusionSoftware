//represents segment lines; fields end1 and end2 represent the two endpoints of the segment line
//uses class Point defined previously
public class Segment {
    private Point end1;
    private Point end2;

    public Segment(double x1, double x2, double y1,double y2){...}
    /*initializes end1 to a Point with coordinates x1, y1,
     and end2 to a Point with coordinates x2, y2 */

    .../* no argument public constructor which initializes end1 to a
      Point with coordinates 0,0, and end2 to a Point with coordinates 1,1 */

    public double getX1(){ ... }/* returns the field x of end1 */
    public double getY1(){ ... }/* returns the field y of end1 */
    public double getX2(){ ... }/* returns the field x of end2 */
    public double getY2(){ ... }/* returns the field y of end2 */

    public ... getEnd1(){...}//returns a new point with the same coordinates as end1
    public ... getEnd2(){...}//returns a new point with the same coordinates as end2

    public double length(){ ... }/* returns the length of this segment;
            it MUST use the method distanceTo() from class Point */

    public ... isLonger(Segment other){ ... }/* returns true
     if this Segment is longer than the other Segment and false otherwise;
     it MUST use method length() */

    public ... midPoint(){ ... }/* returns a new Point representing
    	the middle of this Segment (it creates a new Point object
    	and returns a reference to it); note the coordinates of the middle are the averages of the coordinates of the end points*/

    public ... isEqual(Segment other){...}//returns true if this segment is equal to the other segment;
    //two segment lines are eqaul if they have the same end points, but not necessarily in the same order

    public static double longest(Segment[] arr){ ... }/* returns the length
        of the longest Segment in the array; it MUST use method isLonger()*/

    //returns a string representation of the segment line
    public String toString(){
        .....
    }
}//end class SEgment
