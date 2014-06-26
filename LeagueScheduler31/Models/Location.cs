using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LeagueScheduler.Models
{
    public class Location
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Link { get; set; }
        public string Address { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }
}