using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LeagueScheduler.Models
{
    public class LeagueUser
    {
        public int Id { get; set; }
        public int LeagueId { get; set; }
        public string UserId { get; set; }
        public string Permission { get; set; }
    }
}