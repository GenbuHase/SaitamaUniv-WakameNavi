import Bus from "@/utils/Bus";

const { KokusaiKogyoBus, SeibuBus } = Bus;

// /api/v1/bus/busstops?company=(Seibu|KokusaiKogyo)?&id=string?&name=string?
export default defineEventHandler(async event => {
  const { company, id, name } = getQuery(event) as { [K: string]: string };

  if (!id && !name) {
    throw createError({
      statusCode: 400,
      data: "A query-parameter 'id' or 'name' is required."
    });
  }

  return Busstops.find(company, id, name);
});

export namespace Busstops {
  export function find (company: string, id: string, name: string) {
    if (id) return KokusaiKogyoBus.Busstop.findById(id);
    if (name) return KokusaiKogyoBus.Busstop.findByName(name);

    return false;
  }
}