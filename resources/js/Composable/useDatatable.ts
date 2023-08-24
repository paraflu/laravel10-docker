import {onMounted, Ref, ref} from "vue";
import {Api} from "datatables.net";
import JQuery from "jquery";

export interface Action {
    action?: string;
    id?: string;
    event: Event | JQuery.Event;
    row?: any;
}

export type ActionCallback = (action: Action) => void;

/**
 * Gestione datatable
 *
 * @param tableRef Ref all'elemento che contiene la datatable
 * @param callback callback da richiamare in caso di click su bottoni action
 * @param eventsName nome dell'evento/degli eventi da intercettare (https://datatables.net/reference/event/)
 */
export function useDatatable(
    tableRef: Ref<HTMLElement | null>,
    callback?: ActionCallback,
    eventsName: string | string[] = []
) {
    const onAction = ref<Action | null>(null);

    const dtInstance = ref<Api<any> | null>(null);
    let row = ref<any>(null);

    const handleActionButton = (event: JQuery.ClickEvent) => {
        const {action, id} = (event.currentTarget as HTMLElement).dataset;
        onAction.value = {action, id, event, row: row.value};
        callback?.(onAction.value!);
    };

    const eventHanlder = (evtName: string, event: Event) => {
        callback?.({event, action: evtName});
    };

    onMounted(() => {
        dtInstance.value = (tableRef.value as any).dt;
        if (dtInstance.value) {
            JQuery((dtInstance.value as any).table().body()).on(
                "click",
                "a[data-action],button[data-action]",
                function (e) {
                    row.value = dtInstance.value
                        ?.row(JQuery(this).closest("tr"))
                        .data();
                    handleActionButton(e);
                }
            );
            JQuery((dtInstance.value as any).table().body()).on(
                "click",
                "tr",
                function (e) {
                    row.value = dtInstance.value
                        ?.row(JQuery(this).closest("tr"))
                        .data();
                }
            );
        }
        if (typeof eventsName === "string") {
            eventsName = [eventsName];
        }

        eventsName.forEach((evtName) =>
            dtInstance.value?.on(evtName, (e) => eventHanlder(evtName, e))
        );
    });

    const redraw = () => dtInstance.value?.draw();

    const search = (input: string, regexp = false, smart = true) => {
        return dtInstance.value?.search(input, regexp, smart);
    }

    return {onAction, redraw, dtInstance, row, search};
}
