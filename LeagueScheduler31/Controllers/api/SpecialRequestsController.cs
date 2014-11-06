using LeagueScheduler.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace LeagueScheduler.Controllers
{
    public class SpecialRequestsController : ApiController
    {
        private ISpecialRequestRepository repository = new SpecialRequestRepository();


        public List<SpecialRequest> Get(int leagueId)
        {
            return this.repository.All.Where(x => x.LeagueId == leagueId).ToList();
        }

        public SpecialRequest Post(SpecialRequest item)
        {
            if (string.IsNullOrEmpty(item.RequestText))
            {
                this.repository.Delete(item.Id);
            }
            else
            {
                this.repository.InsertOrUpdate(item);
            }
            this.repository.Save();
            return item;
        }

        public SpecialRequest Put(SpecialRequest item)
        {
            if (string.IsNullOrEmpty(item.RequestText))
            {
                this.repository.Delete(item.Id);
            }
            else
            {
                this.repository.InsertOrUpdate(item);
            }
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
