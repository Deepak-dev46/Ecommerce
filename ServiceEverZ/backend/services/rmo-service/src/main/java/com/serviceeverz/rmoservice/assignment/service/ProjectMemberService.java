package com.serviceeverz.rmoservice.assignment.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.serviceeverz.rmoservice.assignment.entity.ProjectMember;
import com.serviceeverz.rmoservice.assignment.repository.ProjectMemberRepository;

@Service
public class ProjectMemberService {
	ProjectMemberRepository memberRepository; 

	public ProjectMemberService(ProjectMemberRepository memberRepository) {
		super();
		this.memberRepository = memberRepository;
	}

	public List<Long> getProjectIdByUserId(Long userId) {
		List<ProjectMember> projects=memberRepository.findByUserIdAndActiveTrue(userId);
		List<Long> ids= new ArrayList<>();
		for (ProjectMember projectMember : projects) {
			if (projects.size()!=0) {
				ids.add(projectMember.getProjectId());
			}
		}
		return ids;
	}

	public void deleteAllMembers(Long id) {
		memberRepository.deleteByProjectId(id);
	}
	
}
