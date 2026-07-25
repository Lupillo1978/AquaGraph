export default class FeedingCalculator {

    calculateDailyFood(kilograms) {

        return kilograms * 1000;

    }

    calculateFoodPerFeeder(totalGrams, feeders) {

        if (!feeders || feeders.length === 0) {

            return 0;

        }

        return totalGrams / feeders.length;

    }

    buildFeedingProgram(
        pond,
        diet,
        dailyKg,
        gramsPerSecond
    ) {

       console.log("=== GENERANDO PROGRAMACIÓN ===");

       console.log("Estanque:", pond.name);

       console.log("Dieta:", diet.name);

       console.log("Kg por día:", dailyKg);

       console.log("Gramos/segundo:", gramsPerSecond);

      const totalGrams =

    this.calculateDailyFood(

        dailyKg

    );

const gramsPerFeeder =

    this.calculateFoodPerFeeder(

        totalGrams,

        pond.feeders

    );

    const feeders =

    pond.feeders.map(feeder => ({

        feederId: feeder.id,

        nodeId: feeder.nodeId,

        dailyFoodGrams: gramsPerFeeder,

        schedule: diet.blocks.map(block => {

    const durationMinutes =

        this.calculateDurationMinutes(

            block.start,

            block.end

        );

    const shots =

        this.calculateShots(

            durationMinutes,

            block.interval

        );

    const blockGrams =

        this.calculateBlockGrams(

            gramsPerFeeder,

            block.percentage

        );

        const gramsPerShot =

             this.calculateGramsPerShot(

               blockGrams,

               shots

            );

        const secondsPerShot =

             this.calculateSecondsPerShot(

              gramsPerShot,

              gramsPerSecond

            );

    return {

        start: block.start,

        end: block.end,

        percentage: block.percentage,

        interval: block.interval,

        durationMinutes,

        shots,

        blockGrams,

        gramsPerShot,

        secondsPerShot

    };

})

           }));



           const executionProgram =

    feeders.map(feeder => ({

        nodeId: feeder.nodeId,

        schedule: feeder.schedule.map(block => ({

            start: block.start,

            interval: block.interval,

            shots: block.shots,

            seconds: block.secondsPerShot

        }))

    }));



return {

    pondId: pond.id,

    dietId: diet.id,

    dailyFoodKg: dailyKg,

    gramsPerSecond,

    feeders,

    executionProgram

};

    } 


    calculateDurationMinutes(start, end) {

    const [h1, m1] = start.split(":").map(Number);

    const [h2, m2] = end.split(":").map(Number);

    const startMinutes = h1 * 60 + m1;

    const endMinutes = h2 * 60 + m2;

    return endMinutes - startMinutes;

}

calculateShots(durationMinutes, interval) {

    if (interval <= 0) {

        return 0;

    }

    return Math.floor(

        durationMinutes / interval

    );

}

calculateBlockGrams(
    feederGrams,
    percentage
) {

    return (

        feederGrams * percentage

    ) / 100;

}

calculateGramsPerShot(
    blockGrams,
    shots
) {

    if (shots <= 0) {

        return 0;

    }

    return blockGrams / shots;

}

calculateSecondsPerShot(
    gramsPerShot,
    gramsPerSecond
) {

    if (gramsPerSecond <= 0) {

        return 0;

    }

    return Number(

        (gramsPerShot / gramsPerSecond)

        .toFixed(2)

    );

}

}