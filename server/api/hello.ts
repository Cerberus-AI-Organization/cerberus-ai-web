import { useDelay } from "~/composables/delay"

export default defineEventHandler(async () => {
    function getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min
    }

    const number = getRandomInt(0, 10)
    if (number >= 8)
        await useDelay(2000)

    return {
        hello: number,
    }
})
