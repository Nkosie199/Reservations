package com.frankmoley.landon.data.repository;

import org.springframework.data.repository.PagingAndSortingRepository;

import com.frankmoley.landon.data.entity.Guest;
import org.springframework.stereotype.Repository;

@Repository
public interface GuestRepository extends PagingAndSortingRepository<Guest, Long> {

}