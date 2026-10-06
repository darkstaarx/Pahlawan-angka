# Short fraction question layout

Removed the 150px question-slot cap for visual fractions. The question now
uses the card's remaining height above the fixed answer buttons. The prompt
is a normal block, preserving inline bold text and punctuation, instead of
splitting text nodes into column flex items. Only the question container
owns scrolling; the inner prompt no longer gets implicit vertical scrolling
from overflow-x:hidden.

Actual D1 bank unmarked_symbol/kertas was materialised and rendered through
paintQuestion. At 486x924 and 390x844 the picture and prompt fit without
scrolling, and all answers remain inside the viewport. At 360x640 and
844x390 the available space still requires one question scroll area; answers
remain visible. Long prompts scroll to the end at all four sizes. Interactive
shade questions retain their hidden duplicate question slot and working
answer panel, checked at 390x844. Desktop/mobile Edge used for verification.

Screenshots inspected at 486x924 and 390x844. Whitespace check passed.
This correction remains local, alongside the earlier entry-video fix.
