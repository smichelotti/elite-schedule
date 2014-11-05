using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LeagueScheduler.Models
{
    public class SpecialRequest
    {
        public int Id { get; set; }
        public string RequestText { get; set; }
        public int TeamId { get; set; }
        public int LeagueId { get; set; }
    }
}