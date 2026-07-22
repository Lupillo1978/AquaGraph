export default class DietTimeline {

    build(items) {

        const timeline = [];

        items.forEach(item => {

            const start = this.toMinutes(item.start);

            const end = this.toMinutes(item.end);

            const interval = Number(item.interval);

            if (interval <= 0) {

                return;

            }

            for (

                let minute = start;

                minute < end;

                minute += interval

            ) {

                timeline.push({

                    minute,

                    percentage: Number(item.percentage)

                });

            }

        });

        return timeline.sort(

            (a,b)=>a.minute-b.minute

        );

    }

    toMinutes(time) {

        const parts = time.split(":");

        return (

            Number(parts[0]) * 60 +

            Number(parts[1])

        );

    }

}