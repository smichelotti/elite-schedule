using LeagueScheduler.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace LeagueScheduler.Controllers
{
    [Authorize]
    public class SlotsController : ApiController
    {
        private ISlotRepository repository = new SlotRepository();

        public List<Slot> Get(int leagueId)
        {
            return this.repository.All.Where(x => x.LeagueId == leagueId).OrderBy(x => x.StartTime).ThenBy(x => x.LocationId).ToList();
        }

        public Slot Post(Slot item)
        {
            this.repository.InsertOrUpdate(item);
            this.repository.Save();
            return item;
        }

        public Slot Put(Slot item)
        {
            this.repository.InsertOrUpdate(item);
            this.repository.Save();
            return item;
        }

        public HttpResponseMessage Delete(int id)
        {
            this.repository.Delete(id);
            this.repository.Save();
            var response = this.Request.CreateResponse(HttpStatusCode.NoContent);
            return response;
        }
    }
}
