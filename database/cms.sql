use cumsdbms;

CREATE TABLE IF NOT EXISTS `admin`(
	`admin_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`admin_id`)
);

CREATE TABLE IF NOT EXISTS `course` (
	`c_id` VARCHAR(100) NOT NULL UNIQUE,
	`semester` INT NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	`c_type` VARCHAR(255) NOT NULL,
	`credits` INT NOT NULL,
	`dept_id` VARCHAR(255) NOT NULL,
	PRIMARY KEY (`c_id`)
);

CREATE TABLE IF NOT EXISTS `student` (
	`s_id` VARCHAR(36) NOT NULL,
	`s_name` VARCHAR(255) NOT NULL,
	`gender` VARCHAR(6) NOT NULL,
	`dob` DATE NOT NULL,
	`email` VARCHAR(255) NOT NULL UNIQUE,
	`s_address` VARCHAR(255) NOT NULL,
	`contact` VARCHAR(12) NOT NULL,
	`password` VARCHAR(255) NOT NULL,
	`section` INT NOT NULL,
	`joining_date` DATE DEFAULT(CURRENT_DATE),
	`dept_id` VARCHAR(255),	
	PRIMARY KEY (`s_id`)
);

CREATE TABLE IF NOT EXISTS `staff` (
	`st_id` VARCHAR(36) NOT NULL,
	`st_name` VARCHAR(255) NOT NULL,
	`gender` VARCHAR(6) NOT NULL,
	`dob` DATE NOT NULL,
	`email` VARCHAR(255) NOT NULL UNIQUE,
	`st_address` VARCHAR(255) NOT NULL,
	`contact` VARCHAR(12) NOT NULL,
	`dept_id` VARCHAR(255) NOT NULL,
	`password` VARCHAR(255) NOT NULL,
	PRIMARY KEY (`st_id`)
);

CREATE TABLE IF NOT EXISTS `department` (
	`dept_id` VARCHAR(255) NOT NULL UNIQUE,
	`d_name` VARCHAR(255) NOT NULL UNIQUE,
	PRIMARY KEY (`dept_id`)
);

CREATE TABLE IF NOT EXISTS `fee` (
	`fee_id` INT NOT NULL AUTO_INCREMENT UNIQUE,
	`fee_type` VARCHAR(255) NOT NULL,
	`reciept_no` BINARY NOT NULL ,
	`date` DATE NOT NULL UNIQUE,
	`s_id` VARCHAR(36) NOT NULL,
	PRIMARY KEY (`fee_id`)
);

CREATE TABLE IF NOT EXISTS `class` (
	`class_id` INT NOT NULL AUTO_INCREMENT UNIQUE,
	`section` INT NOT NULL,
	`semester` INT NOT NULL,
	`year` DATE DEFAULT(CURRENT_DATE),
	`c_id` VARCHAR(100),
	`st_id` VARCHAR(36) NOT NULL,
	PRIMARY KEY (`class_id`)
);

CREATE TABLE IF NOT EXISTS `assignment` (
	`asg_id` INT NOT NULL AUTO_INCREMENT,
	`day` DATETIME DEFAULT CURRENT_TIMESTAMP,
	`deadline` DATETIME NOT NULL,
	`class_id` INT NOT NULL,
	PRIMARY KEY (`asg_id`)
);

CREATE TABLE IF NOT EXISTS `attendance` (
	`s_id` VARCHAR(36) NOT NULL,
	`date` DATE NOT NULL,
	`c_id` VARCHAR(100) NOT NULL,
	`status` BOOLEAN DEFAULT NULL,
	PRIMARY KEY (`s_id`,`c_id`,`date`)
);

CREATE TABLE IF NOT EXISTS `marks` (
	`test_id` INT NOT NULL AUTO_INCREMENT,
	`tt_marks` INT,
	`ob_marks` INT,
	`test_type` INT,
	`s_id` VARCHAR(36) NOT NULL,
	PRIMARY KEY (`test_id`)
);

CREATE TABLE IF NOT EXISTS `assignment_submission` (
	`s_id` VARCHAR(36) NOT NULL,
	`asg_id` INT NOT NULL,
	PRIMARY KEY (`s_id`,`asg_id`)
);

CREATE TABLE IF NOT EXISTS `time_table` (
	`c_id` VARCHAR(100),
	`st_id` VARCHAR(36) NOT NULL,
	`section` INT NOT NULL,
	`day` INT NOT NULL,
	`start_time` TIME NOT NULL,
	`end_time` TIME NOT NULL,
	PRIMARY KEY (`c_id`,`section`,`day`)
);

ALTER TABLE `course` ADD CONSTRAINT `course_fk0` FOREIGN KEY (`dept_id`) REFERENCES `department`(`dept_id`) on update cascade on delete restrict;

ALTER TABLE `student` ADD CONSTRAINT `student_fk0` FOREIGN KEY (`dept_id`) REFERENCES `department`(`dept_id`) on update cascade on delete restrict;

ALTER TABLE `staff` ADD CONSTRAINT `staff_fk0` FOREIGN KEY (`dept_id`) REFERENCES `department`(`dept_id`) on update cascade on delete restrict;

ALTER TABLE `fee` ADD CONSTRAINT `fee_fk0` FOREIGN KEY (`s_id`) REFERENCES `student`(`s_id`) on update cascade on delete restrict;

ALTER TABLE `attendance` ADD CONSTRAINT `attendance_fk0` FOREIGN KEY (`s_id`) REFERENCES `student`(`s_id`) on update cascade on delete restrict;

ALTER TABLE `attendance` ADD CONSTRAINT `attendance_fk1` FOREIGN KEY (`c_id`) REFERENCES `course`(`c_id`) on update cascade on delete restrict;

ALTER TABLE `class` ADD CONSTRAINT `class_fk0` FOREIGN KEY (`c_id`) REFERENCES `course`(`c_id`) on update cascade on delete restrict;

ALTER TABLE `class` ADD CONSTRAINT `class_fk1` FOREIGN KEY (`st_id`) REFERENCES `staff`(`st_id`) on update cascade on delete restrict;

ALTER TABLE `assignment` ADD CONSTRAINT `assignment_fk0` FOREIGN KEY (`class_id`) REFERENCES `class`(`class_id`) on update cascade on delete restrict;

ALTER TABLE `assignment_submission` ADD CONSTRAINT `assignment_submission_fk0` FOREIGN KEY (`s_id`) REFERENCES `student`(`s_id`) on update cascade on delete restrict;

ALTER TABLE `assignment_submission` ADD CONSTRAINT `assignment_submission_fk1` FOREIGN KEY (`asg_id`) REFERENCES `assignment`(`asg_id`) on update cascade on delete restrict;

ALTER TABLE `time_table` ADD CONSTRAINT `time_table_fk0` FOREIGN KEY (`c_id`) REFERENCES `course`(`c_id`) on update cascade on delete restrict;

ALTER TABLE `time_table` ADD CONSTRAINT `time_table_fk1` FOREIGN KEY (`st_id`) REFERENCES `staff`(`st_id`) on update cascade on delete restrict;

alter table admin
add resetLink varchar(255) default '';

alter table student 
add resetLink varchar(255) default '';

alter table staff
add resetLink varchar(255) default '';