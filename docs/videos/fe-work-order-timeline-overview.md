# Work Order Schedule Timeline - overview and features (owner Loom)

- Source: Loom video transcript
- URL: https://www.loom.com/share/96206a805ac34428b99fd557e5fd02f7
- Transcript pulled: 2026-11-08

---

**0:00**  Hello, this is the Work Order Schedule Timeline. It is a single-page Angular application for scheduling work orders across multiple work centers.

**0:11**  You can switch timescale views, create, edit, and delete work orders. And it prevents also overlaps for work centers. Let me explain about the layout first.

**0:24**  So, on the left, this is the fixed work center column, and on the right, ah, is the horizontal screen. The data, you see here, is loaded with hard-coded sample work centers and work orders.

**0:44**  Okay, here is the timescale drop-down and currently it is 0. It is selected for months at the moment. Let's switch to week and as you can see here, the single coders render at a different scale and let's switch it to day, yeah, this is the day.

**1:04**  And, according to the requirements, I have implemented the infinite scroll for the timeline and yeah.

**1:17**  You can make today as the center of the view. To create a work order, you can click an empty area in a row, here.

**1:36**  the drawer slides in from the right, and as you can see here, the start date is pre-filled based on where you clicked, and end date is, ah, 7 days later from the start date as default.

**1:50**  So, name, demo, and status completed. Yeah, the demo is created, and, ah, on the right side, there is three dot pattern, and, here is edit and delete feature.

**2:11**  Ah, if you press edit button, the work order details drawer is open and you can change game order to and change the status block.

**2:26**  Yeah, the detail is updated and as you can see here, ah, the detail of work order shows as tooltip. Yeah.

**2:38**  And this is the last bit delete. Yeah, it is deleted immediately. And let's check about overlap. Let's switch it to months.

**2:52**  Let's see the details. This worker order ends on March 2nd and this worker order starts on March 4th, so let's edit.

**3:05**  And date is March 6th. Yeah. The worker order ends because can't overlap on the same work center. Yeah. The validation is correct I think.

**3:21**  So this is the main feature and let me explain about the whole project again. Uh, the main page and includes the timeline state and draw state and timeline is separated into share, grid, and bar components.

**3:42**  Draw is a reusable component for… create and edit work order. Uhm, there is also work order store, service, manage, sample data, and overlap checks.

**3:55**  Uh, okay, let me check one thing. Let's edit. Let's edit and change complete. See, yeah, this is changing as complete.

**4:10**  And let's reload page. Yeah, the complete state is changed. And, yeah, it is stored to web browser. And, uh, keep going on previous scenario.

**4:25**  So, Timeline Access Service builds date columns for day, week, and month and converts the date to a frame in pixel positions.

**4:34**  And, um, Overlap Detection uses inclusive range check and excludes the current work order in edit mode. So, the whole thing is, uh, kind covering, uh, the whole thing is, uh, zooming, and creating, editing, and deleting work orders, and, uh, work order overlap validation, and, yeah, that's it.

**5:01**  Yep. Thanks for your time.
