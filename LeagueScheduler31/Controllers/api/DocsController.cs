using LeagueScheduler.Models;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;

namespace LeagueScheduler.Controllers.api
{
    [RoutePrefix("api/docs")]
    public class DocsController : ApiController
    {
        [Route("doc/{*path}")]
        public HttpResponseMessage Get(string path)
        {
            var docsRepo = new DocumentRepository();
            var doc = docsRepo.Get(path);
            var response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(doc, Encoding.UTF8, "application/json");

            return response;
        }

        [Route("doc/{*path}")]
        public HttpResponseMessage Post(string path, [FromBody]dynamic body)
        {
            if (body == null)
            {
                throw new HttpResponseException(this.Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Body cannot be empty."));
            }

            var content = body.ToString();
            var docsRepo = new DocumentRepository();
            docsRepo.Put(path, content);
            var response = this.Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(content, Encoding.UTF8, "application/json");
            return response;
        }
    }
}
