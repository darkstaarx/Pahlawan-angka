#!/usr/bin/env python3
"""Jana fail SRT daripada VO dalam timeline: python3 make_srt.py timeline_90 srt/promo-90s.srt"""
import importlib, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from timeline_common import write_srt

tl = importlib.import_module(sys.argv[1])
os.makedirs(os.path.dirname(sys.argv[2]) or '.', exist_ok=True)
write_srt(tl.subtitle_chunks(), sys.argv[2])
