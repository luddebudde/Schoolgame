export const handleWallBounce = (circle, world) => {    
    if (circle.pos.x - circle.radius <= 0){
        circle.acc.x *= -1
        circle.pos.x = circle.radius
    }
    if (circle.pos.y - circle.radius <= 0){
        circle.acc.y *= -1
        circle.pos.y = circle.radius
    }
    if (circle.pos.x + circle.radius> world.width){
        circle.acc.x *= -1
        circle.pos.x = world.width - circle.radius
        
    }
    if (circle.pos.y + circle.radius >= world.height){
        circle.acc.y *= -1
        circle.pos.y = world.height - circle.radius
    }
}