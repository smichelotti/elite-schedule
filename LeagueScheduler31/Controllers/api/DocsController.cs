using LeagueScheduler.Models;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;

namespace LeagueScheduler.Controllers.api
{
    [RoutePrefix("api/docs")]
    public class DocsController : ApiController
    {
        private DocumentRepository docsRepo = new DocumentRepository();

        [Route("list")]
        public List<string> GetList(string path)
        {
            var docsRepo = new DocumentRepository();
            var list = docsRepo.GetWithPrefix(path);
            return list;
        }

        //[Route("schedule-requests-list")]
        [Route("schedule-requests-list/league-{leagueId}")]
        public List<string> GetScheduleRequestList(string leagueId)
        {
            var docsRepo = new DocumentRepository();
            var list = docsRepo.GetWithPrefix("schedule-requests/league-" + leagueId + "/");
            return list;
        }

        [Route("schedule-requests-full/league-{leagueId}")]
        public HttpResponseMessage GetScheduleRequestsFull(string leagueId)
        {
            var json = docsRepo.GetFullWithPrefix("schedule-requests/league-" + leagueId + "/");
            var response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(json, Encoding.UTF8, "application/json");
            return response;
        }

        //[Route("doc/{*path}")]
        [Route("{*path}")]
        public HttpResponseMessage Get(string path)
        {
            var docsRepo = new DocumentRepository();
            var doc = docsRepo.Get(path);
            var response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(doc, Encoding.UTF8, "application/json");

            return response;
        }

        //[Route("doc/{*path}")]
        [Route("{*path}")]
        public HttpResponseMessage Post(string path, [FromBody]dynamic body)
        {
            if (body == null)
            {
                throw new HttpResponseException(this.Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Body cannot be empty."));
            }

            var content = body.ToString(Formatting.None);
            var docsRepo = new DocumentRepository();
            docsRepo.Put(path, content);
            var response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(content, Encoding.UTF8, "application/json");
            return response;
        }
    }
}
