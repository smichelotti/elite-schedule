using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace LeagueScheduler
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services
            
            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            var settings = new JsonSerializerSettings();
            //settings.Formatting = Formatting.Indented;
            settings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            //settings.DateTimeZoneHandling = DateTimeZoneHandling.Local;// "2013-11-29T18:00:00-05:00"
            //settings.DateTimeZoneHandling = DateTimeZoneHandling.Unspecified;// "2013-11-29T18:00:00"
            settings.DateTimeZoneHandling = DateTimeZoneHandling.Utc;// "2013-11-29T18:00:00Z"
            config.Formatters.JsonFormatter.SerializerSettings = settings;
        }
    }
}
