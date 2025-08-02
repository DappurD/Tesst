import type { Entity } from '../entities/Entity';

/**
 * A utility function to check for axis-aligned bounding box collision.
 * @param a - The first entity with position and dimensions.
 * @param b - The second entity with position and dimensions.
 * @returns True if the entities are colliding, false otherwise.
 */
export function checkCollision(a: Entity, b: Entity): boolean {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

/**
 * Calculates the intersection of a line segment with a rectangle.
 * @returns The closest intersection point and the normal of the edge hit, or null.
 */
export function intersectLineRectangle(lineStart: {x: number, y: number}, lineEnd: {x: number, y: number}, rect: Entity) {
    let closestIntersect: {x: number, y: number, normal: {x: number, y: number}} | null = null;
    let minDistanceSq = Infinity;

    const rectLines = [
        { start: { x: rect.x, y: rect.y }, end: { x: rect.x + rect.width, y: rect.y }, normal: {x: 0, y: -1}}, // Top
        { start: { x: rect.x, y: rect.y }, end: { x: rect.x, y: rect.y + rect.height }, normal: {x: -1, y: 0}}, // Left
        { start: { x: rect.x + rect.width, y: rect.y }, end: { x: rect.x + rect.width, y: rect.y + rect.height }, normal: {x: 1, y: 0}}, // Right
        { start: { x: rect.x, y: rect.y + rect.height }, end: { x: rect.x + rect.width, y: rect.y + rect.height }, normal: {x: 0, y: 1}}, // Bottom
    ];

    for (const edge of rectLines) {
        const x1 = lineStart.x, y1 = lineStart.y;
        const x2 = lineEnd.x, y2 = lineEnd.y;
        const x3 = edge.start.x, y3 = edge.start.y;
        const x4 = edge.end.x, y4 = edge.end.y;
        
        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den === 0) continue; // Parallel lines

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

        if (t > 0 && t < 1 && u >= 0 && u <= 1) {
            const pt = { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
            const distSq = (pt.x - lineStart.x)**2 + (pt.y - lineStart.y)**2;
            
            if (distSq < minDistanceSq) {
                minDistanceSq = distSq;
                closestIntersect = { ...pt, normal: edge.normal };
            }
        }
    }
    return closestIntersect;
}

/**
 * Calculates the squared distance from a point to a line segment.
 * @param p - The point.
 * @param a - The start of the line segment.
 * @param b - The end of the line segment.
 * @returns The squared distance.
 */
export function getSqDistToSegment(p: {x:number, y:number}, a: {x:number, y:number}, b: {x:number, y:number}) {
    const l2 = (b.x-a.x)**2 + (b.y-a.y)**2;
    if(l2 === 0) return (p.x-a.x)**2 + (p.y-a.y)**2;
    
    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));

    const closestPoint = {x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y)};
    
    const dx = p.x - closestPoint.x;
    const dy = p.y - closestPoint.y;
    return dx*dx + dy*dy;
}
