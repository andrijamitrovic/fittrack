using System;
using System.Collections.Generic;
using System.Text;

namespace FitTrack.Application.DTOs
{
    public class ViewSetDTO
    {
        public required int SetNumber { get; set; }
        public int? Reps { get; set; }
        public decimal? Weight { get; set; }
        public decimal? Rpe { get; set; }
        public required bool IsWarmup { get; set; }
    }
}
