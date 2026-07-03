class IdGenerator {

    generate(prefix, items) {

        if (!items || items.length === 0) {
            return `${prefix}-0001`;
        }

        const ids = items
            .map(item => item.id)
            .filter(id => id && id.startsWith(prefix));

        if (ids.length === 0) {
            return `${prefix}-0001`;
        }

        const lastNumber = Math.max(
            ...ids.map(id => parseInt(id.split("-")[1], 10))
        );

        const next = String(lastNumber + 1).padStart(4, "0");

        return `${prefix}-${next}`;
    }

}

module.exports = new IdGenerator();