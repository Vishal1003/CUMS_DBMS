use cumsdbms;

CREATE TABLE `course` (
	`c_id` INT NOT NULL AUTO_INCREMENT,
	`semester` INT NOT NULL,
	`year` INT NOT NULL,
	`name` VARCHAR(255),
	`c_type` varchar(255) NOT NULL,
	`credits` INT NOT NULL UNIQUE,
	`dept_id` varchar(255) NOT NULL,
	PRIMARY KEY (`c_id`,`semester`,`year`)
);

CREATE TABLE `StudentCourses` (
	`s_id` INT NOT NULL,
	`c_id` INT NOT NULL,
	PRIMARY KEY (`s_id`,`c_id`)
);

CREATE TABLE `student` (
	`s_id` INT NOT NULL AUTO_INCREMENT,
	`s_name` varchar(255) NOT NULL,
	`gender` varchar(255) NOT NULL,
	`dob` DATETIME NOT NULL,
	`email` varchar(255) NOT NULL UNIQUE,
	`s_address` VARCHAR(255),
	`contact` INT NOT NULL,
	`class_id` INT NOT NULL,
	`password` varchar(255) NOT NULL,
	PRIMARY KEY (`s_id`)
);

CREATE TABLE `staff` (
	`st_id` INT NOT NULL AUTO_INCREMENT,
	`st_name` varchar(255) NOT NULL,
	`gender` varchar(255) NOT NULL,
	`dob` DATETIME NOT NULL,
	`email` varchar(255) NOT NULL UNIQUE,
	`st_address` VARCHAR(255),
	`contact` INT NOT NULL,
	`dept_id` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	PRIMARY KEY (`st_id`)
);

CREATE TABLE `department` (
	`dept_id` varchar(255) NOT NULL UNIQUE,
	`d_name` varchar(255) NOT NULL UNIQUE,
	PRIMARY KEY (`dept_id`)
);

CREATE TABLE `staffCourse` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`st_id` INT NOT NULL,
	`c_id` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `fee` (
	`fee_id` int NOT NULL AUTO_INCREMENT UNIQUE,
	`fee_type` varchar(255) NOT NULL,
	`reciept_no` BINARY NOT NULL ,
	`date` DATE NOT NULL UNIQUE,
	`s_id` INT NOT NULL UNIQUE,
	PRIMARY KEY (`fee_id`)
);

CREATE TABLE `class` (
	`class_id` INT NOT NULL AUTO_INCREMENT UNIQUE,
	`section` INT NOT NULL,
	`semester` INT NOT NULL,
	`c_id` INT NOT NULL,
	`st_id` INT NOT NULL,
	PRIMARY KEY (`class_id`)
);

CREATE TABLE `assignment` (
	`asg_id` INT NOT NULL AUTO_INCREMENT,
	`day` DATE NOT NULL ,
	`time_slot` DATETIME NOT NULL,
	`st_id` INT NOT NULL,
	`c_id` INT NOT NULL,
	PRIMARY KEY (`asg_id`)
);

CREATE TABLE `attendance` (
	`s_id` INT NOT NULL DEFAULT false,
	`date` DATE NOT NULL,
	`status` BOOLEAN NOT NULL DEFAULT false,
	PRIMARY KEY (`s_id`,`date`)
);

CREATE TABLE `marks` (
	`test_id` INT NOT NULL AUTO_INCREMENT,
	`tt_marks` INT,
	`ob_marks` INT,
	`test_type` INT,
	`s_id` INT NOT NULL,
	PRIMARY KEY (`test_id`)
);

CREATE TABLE `assignment_submission` (
	`s_id` INT NOT NULL,
	`asg_id` INT NOT NULL,
	PRIMARY KEY (`s_id`,`asg_id`)
);

ALTER TABLE `course` ADD CONSTRAINT `course_fk0` FOREIGN KEY (`dept_id`) REFERENCES `department`(`dept_id`);

ALTER TABLE `StudentCourses` ADD CONSTRAINT `StudentCourses_fk0` FOREIGN KEY (`s_id`) REFERENCES `student`(`s_id`) on update cascade on delete restrict;

ALTER TABLE `StudentCourses` ADD CONSTRAINT `StudentCourses_fk1` FOREIGN KEY (`c_id`) REFERENCES `course`(`c_id`) on update cascade on delete restrict;

ALTER TABLE `student` ADD CONSTRAINT `student_fk0` FOREIGN KEY (`class_id`) REFERENCES `class`(`class_id`) on update cascade on delete restrict;

ALTER TABLE `staff` ADD CONSTRAINT `staff_fk0` FOREIGN KEY (`dept_id`) REFERENCES `department`(`dept_id`) on update cascade on delete restrict;

ALTER TABLE `staffCourse` ADD CONSTRAINT `staffCourse_fk0` FOREIGN KEY (`st_id`) REFERENCES `staff`(`st_id`);

ALTER TABLE `staffCourse` ADD CONSTRAINT `staffCourse_fk1` FOREIGN KEY (`c_id`) REFERENCES `course`(`c_id`);

ALTER TABLE `fee` ADD CONSTRAINT `fee_fk0` FOREIGN KEY (`s_id`) REFERENCES `student`(`s_id`) ;

ALTER TABLE `class` ADD CONSTRAINT `class_fk0` FOREIGN KEY (`c_id`) REFERENCES `course`(`c_id`) on update cascade on delete restrict;

ALTER TABLE `class` ADD CONSTRAINT `class_fk1` FOREIGN KEY (`st_id`) REFERENCES `staff`(`st_id`);

ALTER TABLE `assignment` ADD CONSTRAINT `assignment_fk0` FOREIGN KEY (`st_id`) REFERENCES `staff`(`st_id`) on update cascade on delete restrict;

ALTER TABLE `assignment` ADD CONSTRAINT `assignment_fk1` FOREIGN KEY (`c_id`) REFERENCES `course`(`c_id`) on update cascade on delete restrict;

ALTER TABLE `attendance` ADD CONSTRAINT `attendance_fk0` FOREIGN KEY (`s_id`) REFERENCES `StudentCourses`(`s_id`);

ALTER TABLE `marks` ADD CONSTRAINT `marks_fk0` FOREIGN KEY (`s_id`) REFERENCES `StudentCourses`(`s_id`);

ALTER TABLE `assignment_submission` ADD CONSTRAINT `assignment_submission_fk0` FOREIGN KEY (`s_id`) REFERENCES `student`(`s_id`);

ALTER TABLE `assignment_submission` ADD CONSTRAINT `assignment_submission_fk1` FOREIGN KEY (`asg_id`) REFERENCES `assignment`(`asg_id`);
