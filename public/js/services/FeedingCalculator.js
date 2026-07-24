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

}