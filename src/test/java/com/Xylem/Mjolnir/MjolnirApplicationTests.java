package com.Xylem.Mjolnir;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class MjolnirApplicationTests {

	@MockitoBean
	Firestore firestore;

	@MockitoBean
	FirebaseApp firebaseApp;

	@MockitoBean
	FirebaseAuth firebaseAuth;

	@Test
	void contextLoads() {
	}

}
