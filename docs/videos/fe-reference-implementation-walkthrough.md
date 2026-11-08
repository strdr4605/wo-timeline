# Reference implementation walkthrough: WorkOrderTimelineSchedule component (owner Loom)

- Source: Loom video transcript
- URL: https://www.loom.com/share/728c42f5b9a341a88c1a5fad167df398
- Transcript pulled: 2026-11-08

---

**00:00**  Hello everyone, my name is Ranvil Disa and in this video, I will walk you through my implementation on WorkOrderTimelineSchedule component.

**00:12**  First of all, I want to thank Oliver and Gabrielly for inviting me. Now, let's dive into how my, uh, UI looks.

**00:23**  So, let me write a command ng serve. You see, like, my project is building on a localhost port 4200. Let me copy the link and paste it in the new browser.

**00:40**  This is how my UI looks. So, let me give you a brief overview. of the system. The goal of this system is to help manufacturing planners visualize and manage work orders across multiple workstations.

**00:58**  From a business perspective, planners need to see all the work at glance. If I go in month, you see all the work.

**01:08**  Identify work status instantly, you see all the status here. Create and edit, uh, work orders directly on the timeline, uh, and prevent, uh, scheduling conflicts.

**01:24**  Conflicts on the same machine or production line. This interface, uh, solves those problems using an interactive interface. So, let uh, Zoomable Scheduling Timeline.

**01:37**  So, now let's, now let's, uh, start into a brief overview of the layout. So, on the left side, we have a work center panel, if you see right here.

**01:52**  This represents some machine or production lines. For example, we have Genesis Hardware, Rod, Rodriguez Electrics, Consulting INC, MCU Maru Distribution.

**02:02**  Uh, Spartan Manufacturing, this section remains fixed. You see, when I scroll horizontally, it doesn't scroll because I have, like, made, implemented this section as fixed.

**02:17**  And now, if I go on the right side, we have the text. Which is, uh, horizontally scrollable. Let me show you.

**02:27**  So this is how it, uh, looks like when. And I scroll the timeline grid. If you see like the, each row aligns with the work center, you see like each row is highlighted with highlighted and is aligned with the work center.

**02:43**  And you see like these are the work order bars and it aligns represented as a work order. I've also implemented like row hover states.

**02:56**  You see the row hover highlights. You see right here, which aligns with the work centers. And I've did a proper alignment to match the design specification.

**03:08**  Also, if you see, uh, the zoom levels right here, you see, you see our panel, like, with, uh, timescale as month, week, day, hours.

**03:19**  So, if I click month, you see a vertical line and that states the current month with a, with a header.

**03:31**  And if you see week, you see a current week. If I press date, you see a current day. And if I press hour, you see a current hour.

**03:41**  And, uh, so. Here's what it looks like. Let me explain you a little bit about the work order block.

**03:53**  You see, this is the work order bars. We have the work order name. We have the status indicator. And we, And when we, and if you notice, like, when I hover on the work order bar, you see, uh, this three dot.

**04:10**  If I press this button, you see, uh, sliders. Slide out panel. And here we have two options, edit and delete.

**04:17**  If we click edit, you see, uh, work order detail, uh, panel slides from the right. We also have implemented the box shadow.

**04:33**  And here, you can see, uh, the status is complete. And, uh, if, I can also, like, change the status to, like, open, uh, I can do in progress, I can do, uh, block.

**04:48**  Every status indicator has its own color. And if I press save, the work order bar, uh, it, is now, the status of the work order bar is now blocked.

**05:02**  If I press save, you see, it's blocked. So each work order is now rendered as horizontal bar, positioned based on its start and end date.

**05:15**  Inside each bar, I display the display, uhm, if I press here, I display the work order name, you see some of the description mentioned, uh, for the below information, specify the date, name and status for this order.

**05:36**  This allows a planner to to quickly understand production state without, uh, opening details. If you see from here, they can, like, clearly understand.

**05:48**  Now, let me show you, uh, like, let me show you a quick flow, like, how a work order bar is created.

**05:59**  Uh, by the way, like, before that, I wanna tell you something, like, if you, look here, you see click to add date tooltip, so this is what CTA is, like, if I press on any empty cell.

**06:18**  You see a work order detail panel slides from the right. Uh, this is where you can create. a work order bar.

**06:31**  Let me write the name of the company as Samsung. Let me write the start and the end date. So, my start date is like April 1, 2025.

**06:46**  Let me write the end date as June 6, June, like, uh, June 2025. If I press create, boom.

**06:58**  There is a bar, there is a work order bar created right here. And this bar is dynamic, it's not like fixed.

**07:11**  If you change the date, it changes the, like, Length of the bar accordingly, uhm, so, let me show you one more thing that this system solves.

**07:29**  So, the work orders, there must might be, like, many work orders for a single work center, but the work orders cannot overlap.

**07:42**  And we can, like, I can show you how does it look like. So, just wait for remember, like, this is, like, close to December 15, 2024.

**07:55**  So, if I write here, here, like, December 14, and here, the end date is, like, uhm, 01, it's, uh, January 8, 2025, and if I write a company, like, uh, Meta, now this will, like, there will be no work order bar name.

**08:27**  That will be created here. So when I create, uh, when I press the create button, you see, there will be a pop-up showing this.

**08:38**  This bar is overlapping. This work order overlaps with an existing work order on the same work center. So this is a feature that is very important for.

**08:51**  Or the work order timeline scheduling system so that the work order do not get overlapped with each other. So this is what overlapped detection is.

**09:09**  This ensures that no two work orders can occupy the same time. Window on the same work center, preventing, uh, production conflict.

**09:19**  Let me, like, uh, give you a brief overview. On, uh, uh, on the edit delete function functionality.

**09:31**  So, if I, like, press delete, then it deletes the work order bar. Let me show you. So if I press delete, hit.

**09:43**  So it deletes the work order bar, and I've also implemented a feature, which is, uh, local persistence.

**09:55**  So if I, like, uh, reload, then the data, the data. Doesn't, like, go, go off, it still stays at the same place.

**10:09**  Uh, the one, the only thing here, uh, is to notice is that. By default, when I reload the page, it goes to the date, but surely when I again press the month, you don't see the work, uh, the bar, which was deleted right here.

**10:27**  So when I press month, if you notice, notice there was a work order bar here, which is now not, uh, which is like complete, like permanent.

**10:43**  Like deleted. So this is the importance of the local persistence. And also like if you create, uh, some, like if you create a work order, it's, it gets.

**10:55**  Store in the local storage of the web browser. Let me show you that. So work order name, let's keep it like.

**11:07**  What name I, uhm, let's keep it like Oracle. Let me get the status in progress and start date is fine and let me change the end date.

**11:31**  So, let me, like, expand it a little bit. Now, if I press the right, no, if I right click on it.

**11:51**  I can press the inspect button. And, uh. If I go to application, local storage. Local host.

**12:13**  You see a name, oracle, work center id. So this is the object. That has been stored on the local storage of the web browser.

**12:29**  This is one of the features I have implemented. So, I guess I have covered everything. The logo is placed on the correct side, on the correct position.

**12:49**  You see there's a sufficient space. There's sufficient between the logo and the work order component, the time scale drop-down is perfectly positioned.

**13:03**  Everything looks good. And if you want, I can show you a quick comparison. Between the sketch and my UI to better understand the positions of.

**13:17**  the components. So, this is the, uh, this is the work order scheduler. Default. And you can see, and you can check mine as well.

**13:30**  Yeah. You can see the buttons. You can see the click to add date color. You can see the length. You can see the.

**13:40**  Box length. And, uh. You can see the view selection. If I press the month, uhm.

**13:56**  If I press the timescale panel, you see, this, the length of the, length and the width of the panel is perfect.

**14:04**  Let's back to the sketch provider. If you see the CDA controls, goals. Thank you. You see this control, absolutely perfect from my side.

**14:21**  Thank If you see, if you see, like, the edit-delete, uh, panel from the sketch. And if you see my edit-delete, edit-delete, edit-delete, uh, panel, I'm sorry, it's.

**14:40**  Perfectly shaped. Let me show you the work order details. It's perfect.

**14:57**  We have shadow. We have, like, panel shadow. Box shadow as well. Let me show you the placeholder of the work already.

**15:11**  So these are the placeholder with proper date when clicked. If you see, like, every fri- field is active. If I press the tab, yeah, it shifts to the different fields.

**15:34**  And if I press the escape, it closes the, uh, work order detail panel. The last is the status drop-down.

**15:52**  If you see my status drop-down, I guess it's perfect. See, it's perfect. So, I guess I have, like, covered everything.

**16:09**  I've showed you the comparison as well. So, thank you so much, uhm. Gabriel and, uh, Oliver for watching this video.

**16:20**  I hope you like this video. And see you soon. Thank you so much and have a nice day.
