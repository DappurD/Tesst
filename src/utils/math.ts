/**
 * A simple utility function for getting a random number in a range.
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns A random number between min and max.
 */
export function rand(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * Reflects a vector off a surface with a given normal.
 * @param incident - The incoming direction vector.
 * @param normal - The normal vector of the surface.
 * @returns The reflected direction vector.
 */
export function reflect(incident: {x: number, y: number}, normal: {x: number, y: number}): {x: number, y: number} {
    const dot = incident.x * normal.x + incident.y * normal.y;
    return {
        x: incident.x - 2 * dot * normal.x,
        y: incident.y - 2 * dot * normal.y
    };
}
