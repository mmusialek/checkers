export class SerializationHelper {

    static serialize(key: string, obj: unknown) {
        if (!key) return false;

        const save = JSON.stringify(obj);
        localStorage.setItem(key, btoa(save));
    }

    static isSaved(key: string) {
        if (!key) return false;

        const str = localStorage.getItem(key);
        if (str) {
            return true;
        }

        return false;
    }

    static deserialize(key: string): unknown {
        if (!key) return null;

        const str = localStorage.getItem(key);
        if (str) {
            const obj = JSON.parse(atob(str));
            return obj;
        }

        return null;
    }
}
