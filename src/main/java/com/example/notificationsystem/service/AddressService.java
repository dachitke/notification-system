package com.example.notificationsystem.service;

import com.example.notificationsystem.model.Address;
import com.example.notificationsystem.repository.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    public List<Address> getAllAddresses() {
        return addressRepository.findAll();
    }

    public Address createAddress(Address address) {
        return addressRepository.save(address);
    }

    public Address updateAddress(Long id, Address updatedAddress) {
        return addressRepository.findById(id)
                .map(address -> {
                    address.setType(updatedAddress.getType());
                    address.setValue(updatedAddress.getValue());
                    address.setStreet(updatedAddress.getStreet());
                    address.setCity(updatedAddress.getCity());
                    address.setCountry(updatedAddress.getCountry());
                    return addressRepository.save(address);
                }).orElse(null);
    }



    public boolean deleteAddress(Long id) {
        if (addressRepository.existsById(id)) {
            addressRepository.deleteById(id);
            return true;
        }
        return false;
    }


    public List<Address> batchUpdateAddresses(List<Address> addresses) {
        return addresses.stream()
                .filter(a -> a.getId() != null)
                .map(a -> updateAddress(a.getId(), a))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
