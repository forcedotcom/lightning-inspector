export default class Queue {
    _task = null;

    add(getPromise) {
        if (this._task == null) {
            return (this._task = getPromise());
        }

        return (this._task = Promise.resolve(this._task)
            .then(() => getPromise())
            .catch(e => {
                console.error(e);

                throw e;
            }));
    }
}
