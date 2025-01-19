import Image from "next/image"

export const Rocket = () => {
    return (
        <p className="relative h-20 w-20 lg:h-[120px] lg:w-[120px]">
            <Image src={'/rocket.png'} alt="rocket" className="object-contain p-2 rounded-full bg-zemer" fill />
        </p>
    )
}

export const Rocket2 = () => {
    return (
        <p className="relative h-5 w-5">
            <Image src={'/rocket.png'} alt="rocket" className="object-contain rounded-full ring-1 ring-elegant/50" fill />
        </p>
    )
}